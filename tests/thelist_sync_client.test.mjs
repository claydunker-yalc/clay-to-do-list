import test from 'node:test';
import assert from 'node:assert/strict';

import {
  linkedOpenBrainTasks,
  shouldAttemptOpenBrainCompletion,
  buildCompletionPayload,
} from '../scripts/thelist_sync_client.mjs';

test('linkedOpenBrainTasks returns only completed Clay Mate-linked tasks', () => {
  const tasks = [
    { id: 't1', text: 'Done linked', completed: true, external_source: 'clay_mate_action_items', external_id: 'a1' },
    { id: 't2', text: 'Open linked', completed: false, external_source: 'clay_mate_action_items', external_id: 'a2' },
    { id: 't3', text: 'Done local', completed: true },
    { id: 't4', text: 'Done other', completed: true, external_source: 'other', external_id: 'x' },
  ];

  assert.deepEqual(linkedOpenBrainTasks(tasks).map((t) => t.id), ['t1']);
});

test('shouldAttemptOpenBrainCompletion only requires backend call for linked completed tasks', () => {
  assert.equal(shouldAttemptOpenBrainCompletion([{ completed: true }]), false);
  assert.equal(shouldAttemptOpenBrainCompletion([{ completed: true, external_source: 'clay_mate_action_items', external_id: 'a1' }]), true);
});

test('buildCompletionPayload sends only safe linked task identifiers', () => {
  const payload = buildCompletionPayload([
    { id: 't1', text: 'Done linked', section: 'Due Today', completed: true, external_source: 'clay_mate_action_items', external_id: 'a1' },
    { id: 't2', text: 'Done local', completed: true },
  ]);

  assert.deepEqual(payload, {
    tasks: [
      { id: 't1', text: 'Done linked', section: 'Due Today', external_source: 'clay_mate_action_items', external_id: 'a1' },
    ],
  });
});
