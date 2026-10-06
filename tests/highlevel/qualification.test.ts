import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canMoveInboundOpportunityStage,
  inboundOpportunityStageId,
  qualificationLevel,
} from '../../lib/highlevel/qualification.ts';
import { lead } from './fixtures.ts';

const stages = {
  consultaStageId: 'stage-consulta-test',
  revisarStageId: 'stage-revisar-test',
};

test('keeps the over_100k priority threshold and does not auto-discard', () => {
  assert.equal(qualificationLevel(lead), 'priority');
  assert.equal(qualificationLevel({
    qualification: { ...lead.qualification, monthlyRevenue: '50k_100k' },
  }), 'review');
  assert.equal(qualificationLevel({
    qualification: { ...lead.qualification, salesModel: 'mercado_libre' },
  }), 'transition');
  assert.equal(qualificationLevel({
    qualification: { ...lead.qualification, decisionRole: 'researching_for_other' },
  }), 'review');
});

test('maps inbound opportunity stages without using Lead cualificado', () => {
  assert.equal(inboundOpportunityStageId('priority', stages), 'stage-consulta-test');
  assert.equal(inboundOpportunityStageId('review', stages), 'stage-revisar-test');
  assert.equal(inboundOpportunityStageId('transition', stages), 'stage-revisar-test');
  assert.equal(canMoveInboundOpportunityStage(undefined, stages), true);
  assert.equal(canMoveInboundOpportunityStage('stage-consulta-test', stages), true);
  assert.equal(canMoveInboundOpportunityStage('stage-revisar-test', stages), true);
  assert.equal(canMoveInboundOpportunityStage('stage-already-progressed', stages), false);
});
