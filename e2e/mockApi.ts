import type { Page, Route } from '@playwright/test';

import type { AdminUser, AnswerResult, Round, Settings, User } from '../src/api/types';

interface Account extends AdminUser {
  password: string | null;
}

const settings: Settings = {
  enabledForms: ['TE', 'PAST'],
  jlptLevels: ['N5', 'N4'],
  roundSize: 5,
  romajiInput: false,
  showFurigana: true,
  timeZone: 'UTC',
};

const oyogu = { dictionaryForm: '泳ぐ', reading: 'およぐ', meaning: 'to swim' };
const expected: Record<string, AnswerResult> = {
  TE: {
    isCorrect: true,
    expected: { kanji: '泳いで', kana: 'およいで' },
    ruleGroup: 'GODAN_GU',
    ruleHint: 'ぐ → いで (泳ぐ → 泳いで)',
  },
  PAST: {
    isCorrect: true,
    expected: { kanji: '泳いだ', kana: 'およいだ' },
    ruleGroup: 'GODAN_GU',
    ruleHint: 'ぐ → いだ (泳ぐ → 泳いだ)',
  },
};

function account(id: string, role: User['role'], status: User['status'], password: string | null) {
  return {
    id,
    username: id,
    email: `${id}@example.com`,
    role,
    status,
    createdAt: '2026-10-01T00:00:00.000Z',
    lastActiveAt: null,
    password,
  } satisfies Account;
}

/** An in-memory stand-in for the backend, enough for the e2e flows. */
export async function mockApi(page: Page) {
  const accounts: Account[] = [
    account('admin', 'ADMIN', 'ACTIVE', 'admin-password-123'),
    account('learner', 'LEARNER', 'ACTIVE', 'learner-password-123'),
    account('newbie', 'LEARNER', 'INVITED', null),
  ];
  const invites = new Map([['invite-token', 'newbie']]);
  let signedIn: Account | null = null;
  const rounds = new Map<string, Round>();
  const answers = new Map<string, { answer: string; result: AnswerResult }>();

  const adminUser = (account: Account): AdminUser => {
    const { password, ...user } = account;
    void password;
    return user;
  };
  const publicUser = (account: Account): User => {
    const { email, ...user } = adminUser(account);
    void email;
    return user;
  };
  const reply = (route: Route, status: number, body?: unknown) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: body === undefined ? '' : JSON.stringify(body),
    });
  const fail = (route: Route, status: number, message: string) =>
    reply(route, status, { statusCode: status, error: 'Error', message });

  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/^\/api/, '');
      const key = `${request.method()} ${path}`;
      const body = request.postDataJSON() as Record<string, string> | null;

      if (key === 'POST /auth/login') {
        const match = accounts.find(
          (a) =>
            a.username === body?.username?.toLowerCase() &&
            a.password &&
            a.password === body?.password,
        );
        if (!match) return fail(route, 401, 'Invalid username or password');
        signedIn = match;
        return reply(route, 200, { user: publicUser(match), csrfToken: 'csrf' });
      }
      if (key === 'POST /auth/accept-invite') {
        const id = invites.get(body?.token ?? '');
        const invited = accounts.find((a) => a.id === id);
        if (!invited) return fail(route, 400, 'This link is invalid or has expired');
        invited.password = body?.password ?? null;
        invited.status = 'ACTIVE';
        invites.delete(body?.token ?? '');
        return reply(route, 204);
      }

      const me = signedIn;
      if (!me) return fail(route, 401, 'Not signed in');
      if (request.method() !== 'GET' && request.headers()['x-csrf-token'] !== 'csrf') {
        return fail(route, 403, 'Missing or invalid CSRF token');
      }
      if (path.startsWith('/admin') && me.role !== 'ADMIN') return fail(route, 403, 'Admins only');

      if (key === 'GET /auth/me') return reply(route, 200, publicUser(me));
      if (key === 'GET /auth/csrf') return reply(route, 200, { csrfToken: 'csrf' });
      if (key === 'POST /auth/logout') {
        signedIn = null;
        return reply(route, 204);
      }
      if (key === 'GET /me/settings') return reply(route, 200, settings);
      if (key === 'PATCH /me/settings') return reply(route, 200, { ...settings, ...body });

      if (key === 'POST /drill/rounds') {
        const round: Round = {
          id: `round-${rounds.size + 1}`,
          mode: 'STANDARD',
          startedAt: new Date().toISOString(),
          items: [
            { id: 'item-1', position: 0, form: 'TE', verb: oyogu },
            { id: 'item-2', position: 1, form: 'PAST', verb: oyogu },
          ],
        };
        rounds.set(round.id, round);
        return reply(route, 201, round);
      }
      const answerMatch = path.match(/^\/drill\/rounds\/([^/]+)\/items\/([^/]+)\/answer$/);
      if (answerMatch && request.method() === 'POST') {
        const item = rounds.get(answerMatch[1])?.items.find((i) => i.id === answerMatch[2]);
        if (!rounds.has(answerMatch[1])) return fail(route, 404, 'Round not found');
        if (!item) return fail(route, 404, 'Item not found');
        const right = expected[item.form];
        const isCorrect = [right.expected.kana, right.expected.kanji].includes(body?.answer ?? '');
        const result = { ...right, isCorrect };
        answers.set(item.id, { answer: body?.answer ?? '', result });
        return reply(route, 200, result);
      }
      const retryMatch = path.match(/^\/drill\/rounds\/([^/]+)\/items\/([^/]+)\/retry$/);
      if (retryMatch && request.method() === 'POST') {
        const item = rounds.get(retryMatch[1])?.items.find((i) => i.id === retryMatch[2]);
        if (!rounds.has(retryMatch[1])) return fail(route, 404, 'Round not found');
        if (!item) return fail(route, 404, 'Item not found');
        const first = answers.get(item.id);
        if (!first || first.result.isCorrect) {
          return fail(route, 409, 'Only a missed item can be retried');
        }
        const right = expected[item.form];
        const isCorrect = [right.expected.kana, right.expected.kanji].includes(body?.answer ?? '');
        return reply(route, 200, { ...right, isCorrect });
      }
      const finishMatch = path.match(/^\/drill\/rounds\/([^/]+)\/finish$/);
      if (finishMatch && request.method() === 'POST') {
        const round = rounds.get(finishMatch[1]);
        if (!round) return fail(route, 404, 'Round not found');
        const done = round.items.filter((i) => answers.has(i.id));
        return reply(route, 200, {
          id: round.id,
          mode: round.mode,
          startedAt: round.startedAt,
          finishedAt: new Date().toISOString(),
          total: round.items.length,
          answered: done.length,
          correct: done.filter((i) => answers.get(i.id)?.result.isCorrect).length,
          mistakes: done
            .filter((i) => !answers.get(i.id)?.result.isCorrect)
            .map((i) => ({
              itemId: i.id,
              position: i.position,
              verb: i.verb,
              form: i.form,
              answer: answers.get(i.id)?.answer,
              expected: expected[i.form].expected,
              ruleHint: expected[i.form].ruleHint,
            })),
        });
      }
      if (key === 'GET /progress') {
        const attempts = [...answers.values()];
        const correct = attempts.filter((a) => a.result.isCorrect).length;
        return reply(route, 200, {
          totals: {
            attempts: attempts.length,
            correct,
            accuracy: attempts.length ? correct / attempts.length : 0,
            roundsFinished: rounds.size,
            dueToday: 1,
          },
          streak: rounds.size ? 1 : 0,
          ruleGroups: [...answers.entries()].map(([itemId, a]) => ({
            form: itemId === 'item-1' ? 'TE' : 'PAST',
            ruleGroup: a.result.ruleGroup,
            attemptCount: 1,
            correctCount: a.result.isCorrect ? 1 : 0,
            accuracy: a.result.isCorrect ? 1 : 0,
            box: a.result.isCorrect ? 1 : 0,
            dueAt: new Date().toISOString(),
            lastPracticedAt: new Date().toISOString(),
          })),
        });
      }

      if (key === 'GET /admin/users') return reply(route, 200, accounts.map(adminUser));
      if (key === 'POST /admin/users') {
        const username = body?.username?.toLowerCase() ?? '';
        if (accounts.some((a) => a.username === username || a.email === body?.email)) {
          return fail(route, 409, 'A user with this username or email already exists');
        }
        const created: Account = {
          ...account(`user${accounts.length}`, 'LEARNER', 'INVITED', null),
          username,
          email: body?.email ?? '',
        };
        accounts.push(created);
        const token = `token-${created.id}`;
        invites.set(token, created.id);
        return reply(route, 201, {
          user: adminUser(created),
          link: `${url.origin}/invite/${token}`,
          expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        });
      }

      return fail(route, 404, `No mock for ${key}`);
    },
  );
}
