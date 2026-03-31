import {
  ComprehendMedicalClient,
  DetectEntitiesV2Command,
  InferICD10CMCommand,
  InferRxNormCommand,
  InferSNOMEDCTCommand,
  type Entity,
  type ICD10CMEntity,
  type RxNormEntity,
  type SNOMEDCTEntity,
} from '@aws-sdk/client-comprehendmedical';

export interface MedicalEntityCode {
  code: string;
  description: string;
  score: number;
}

export interface MedicalEntity {
  text: string;
  score: number;
  type: string;
  traits: string[];
  codes: {
    icd10?: MedicalEntityCode[];
    rxnorm?: MedicalEntityCode[];
    snomed?: MedicalEntityCode[];
  };
}

export interface MedicalInsights {
  analyzedAt: string;
  sourceText: string;
  entities: {
    conditions: MedicalEntity[];
    medications: MedicalEntity[];
    anatomy: MedicalEntity[];
    symptoms: MedicalEntity[];
    testsTreatments: MedicalEntity[];
  };
  icd10Codes: MedicalEntityCode[];
  rxnormCodes: MedicalEntityCode[];
  snomedCodes: MedicalEntityCode[];
  rawEntityCount: number;
}

const comprehendClient = new ComprehendMedicalClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class ComprehendMedicalService {
  async analyzeText(text: string): Promise<MedicalInsights | null> {
    const trimmed = text.trim();
    if (trimmed.length < 3) return null;

    // Run all four APIs in parallel for maximum insight
    const [entitiesResp, icd10Resp, rxnormResp, snomedResp] = await Promise.all([
      comprehendClient.send(new DetectEntitiesV2Command({ Text: trimmed })),
      comprehendClient.send(new InferICD10CMCommand({ Text: trimmed })),
      comprehendClient.send(new InferRxNormCommand({ Text: trimmed })),
      comprehendClient.send(new InferSNOMEDCTCommand({ Text: trimmed })),
    ]);

    const entities = entitiesResp.Entities ?? [];

    return {
      analyzedAt: new Date().toISOString(),
      sourceText: trimmed,
      entities: this.mapEntities(entities),
      icd10Codes: this.extractICD10Codes(icd10Resp.Entities ?? []),
      rxnormCodes: this.extractRxNormCodes(rxnormResp.Entities ?? []),
      snomedCodes: this.extractSNOMEDCodes(snomedResp.Entities ?? []),
      rawEntityCount: entities.length,
    };
  }

  private mapEntities(entities: Entity[]): MedicalInsights['entities'] {
    const result: MedicalInsights['entities'] = {
      conditions: [],
      medications: [],
      anatomy: [],
      symptoms: [],
      testsTreatments: [],
    };

    for (const entity of entities) {
      const mapped: MedicalEntity = {
        text: entity.Text ?? '',
        score: entity.Score ?? 0,
        type: entity.Type ?? '',
        traits: (entity.Traits ?? []).map((t) => t.Name ?? '').filter(Boolean),
        codes: {},
      };

      switch (entity.Category) {
        case 'MEDICAL_CONDITION':
          if (entity.Type === 'DX_NAME') {
            result.symptoms.push(mapped);
          } else {
            result.conditions.push(mapped);
          }
          break;
        case 'MEDICATION':
          result.medications.push(mapped);
          break;
        case 'ANATOMY':
          result.anatomy.push(mapped);
          break;
        case 'TEST_TREATMENT_PROCEDURE':
          result.testsTreatments.push(mapped);
          break;
      }
    }

    return result;
  }

  private extractICD10Codes(entities: ICD10CMEntity[]): MedicalEntityCode[] {
    const codes: MedicalEntityCode[] = [];
    for (const entity of entities) {
      for (const concept of entity.ICD10CMConcepts ?? []) {
        if (concept.Code && concept.Score && concept.Score > 0.5) {
          codes.push({
            code: concept.Code,
            description: concept.Description ?? '',
            score: concept.Score,
          });
        }
      }
    }
    return codes;
  }

  private extractRxNormCodes(entities: RxNormEntity[]): MedicalEntityCode[] {
    const codes: MedicalEntityCode[] = [];
    for (const entity of entities) {
      for (const concept of entity.RxNormConcepts ?? []) {
        if (concept.Code && concept.Score && concept.Score > 0.5) {
          codes.push({
            code: concept.Code,
            description: concept.Description ?? '',
            score: concept.Score,
          });
        }
      }
    }
    return codes;
  }

  private extractSNOMEDCodes(entities: SNOMEDCTEntity[]): MedicalEntityCode[] {
    const codes: MedicalEntityCode[] = [];
    for (const entity of entities) {
      for (const concept of entity.SNOMEDCTConcepts ?? []) {
        if (concept.Code && concept.Score && concept.Score > 0.5) {
          codes.push({
            code: concept.Code,
            description: concept.Description ?? '',
            score: concept.Score,
          });
        }
      }
    }
    return codes;
  }
}
