const EXTERNAL_SOURCE = 'clay_mate_action_items';

function linkedOpenBrainTasks(tasks) {
  return (tasks || []).filter((task) =>
    task &&
    task.completed === true &&
    task.external_source === EXTERNAL_SOURCE &&
    typeof task.external_id === 'string' &&
    task.external_id.length > 0
  );
}

function shouldAttemptOpenBrainCompletion(tasks) {
  return linkedOpenBrainTasks(tasks).length > 0;
}

function buildCompletionPayload(tasks) {
  return {
    tasks: linkedOpenBrainTasks(tasks).map((task) => ({
      id: task.id,
      text: task.text || '',
      section: task.section || null,
      external_source: task.external_source,
      external_id: task.external_id,
    })),
  };
}

async function completeLinkedOpenBrainTasks({ tasks, endpointUrl, accessToken, fetchImpl = fetch }) {
  const payload = buildCompletionPayload(tasks);
  if (!payload.tasks.length) {
    return { ok: true, skipped: true, completed: 0, results: [] };
  }
  if (!endpointUrl) {
    throw new Error('Open Brain completion endpoint is not configured.');
  }
  if (!accessToken) {
    throw new Error('No signed-in session token is available for Open Brain completion sync.');
  }

  const url = endpointUrl.replace(/\/$/, '') + '/complete';
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  let body = null;
  try { body = await response.json(); } catch (_) {}
  if (!response.ok || body?.ok === false) {
    const message = body?.error || body?.message || `Open Brain completion sync failed (${response.status})`;
    throw new Error(message);
  }
  return body || { ok: true };
}

export {
  EXTERNAL_SOURCE,
  linkedOpenBrainTasks,
  shouldAttemptOpenBrainCompletion,
  buildCompletionPayload,
  completeLinkedOpenBrainTasks,
};
