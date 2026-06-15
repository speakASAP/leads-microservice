import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { PRODUCT_APP_METADATA_KEYS, PRODUCT_APP_SOURCE_SERVICES } from './product-app-intake';
import {
  PRODUCT_APP_CONTACT_METHOD_TYPES,
  PRODUCT_APP_INTAKE_COMPATIBILITY_FIXTURES,
} from './product-app-intake-matrix.fixtures';
import type { ProductAppLeadPayload } from './product-app-intake';

async function validationProperties(payload: ProductAppLeadPayload): Promise<string[]> {
  const dto = plainToInstance(CreateLeadDto, payload);
  const errors = await validate(dto, { validationError: { target: false, value: false } });
  return errors.map((error) => error.property).sort();
}

describe('product app intake compatibility matrix', () => {
  it('covers every approved source service and supported contact method pair', () => {
    const expectedPairs = PRODUCT_APP_SOURCE_SERVICES.flatMap((sourceService) =>
      PRODUCT_APP_CONTACT_METHOD_TYPES.map((contactMethodType) => `${sourceService}:${contactMethodType}`),
    ).sort();

    const actualPairs = PRODUCT_APP_INTAKE_COMPATIBILITY_FIXTURES.map((fixture) => fixture.id).sort();

    expect(actualPairs).toEqual(expectedPairs);
    expect(actualPairs).toHaveLength(27);
  });

  it('validates each synthetic matrix payload against CreateLeadDto', async () => {
    const invalidFixtures: Array<{ id: string; properties: string[] }> = [];

    for (const fixture of PRODUCT_APP_INTAKE_COMPATIBILITY_FIXTURES) {
      const properties = await validationProperties(fixture.payload);

      if (properties.length > 0) {
        invalidFixtures.push({ id: fixture.id, properties });
      }
    }

    expect(invalidFixtures).toEqual([]);
  });

  it('keeps fixture metadata and consent evidence within the approved product-app contract', () => {
    const allowedMetadataKeys = new Set<string>(PRODUCT_APP_METADATA_KEYS);

    for (const fixture of PRODUCT_APP_INTAKE_COMPATIBILITY_FIXTURES) {
      const { payload } = fixture;
      const metadataKeys = Object.keys(payload.metadata ?? {});

      expect(payload.sourceService).toBe(fixture.sourceService);
      expect(payload.contactMethods).toHaveLength(1);
      expect(payload.contactMethods[0].type).toBe(fixture.contactMethodType);
      expect(payload.preferredChannel).toBe(fixture.contactMethodType);
      expect(payload.marketingConsent).toBe(true);
      expect(payload.consentSource).toBeTruthy();
      expect(payload.consentCapturedAt).toBe('2026-06-13T00:00:00.000Z');
      expect(new URL(payload.sourceUrl ?? '').hostname.endsWith('.example.test')).toBe(true);
      expect(metadataKeys.every((key) => allowedMetadataKeys.has(key))).toBe(true);
    }
  });
});
