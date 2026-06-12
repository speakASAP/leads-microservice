import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { InternalServiceGuard } from './guards/internal-service.guard';
import { LeadsController } from './leads.controller';

function guardsFor(method: keyof LeadsController) {
  return Reflect.getMetadata(GUARDS_METADATA, LeadsController.prototype[method]) ?? [];
}

describe('LeadsController access controls', () => {
  it('guards raw lead detail retrieval', () => {
    expect(guardsFor('getLead')).toContain(InternalServiceGuard);
  });

  it('guards raw lead list retrieval', () => {
    expect(guardsFor('listLeads')).toContain(InternalServiceGuard);
  });

  it('keeps internal preference and unsubscribe routes guarded', () => {
    expect(guardsFor('getLeadPreferences')).toContain(InternalServiceGuard);
    expect(guardsFor('updateLeadPreferences')).toContain(InternalServiceGuard);
    expect(guardsFor('unsubscribeLead')).toContain(InternalServiceGuard);
  });

  it('does not require internal service credentials for public intake or confirmation', () => {
    expect(guardsFor('submitLead')).not.toContain(InternalServiceGuard);
    expect(guardsFor('confirmLead')).not.toContain(InternalServiceGuard);
  });
});
