import { createBlueprint, getPublicBlueprint, SubmissionValidationError } from '../services/blueprintPersistenceService.js';

export function createBlueprintController(db, generate) {
  return {
    async create(request, response) {
      try {
        const result = await createBlueprint({ db, body: request.body, generate });
        response.status(201).json(result);
      } catch (error) {
        if (error instanceof SubmissionValidationError) return response.status(400).json({ error: error.message, fields: error.errors });
        if (error.message === 'DATABASE_UNAVAILABLE') return response.status(503).json({ error: 'Blueprint storage is temporarily unavailable. Your answers are still saved in this browser; please try again shortly.' });
        console.error('Blueprint submission failed.');
        return response.status(500).json({ error: 'We could not save your blueprint just now. Your answers remain saved in this browser; please try again.' });
      }
    },
    async get(request, response) {
      try {
        const result = await getPublicBlueprint(db, request.params.reference);
        if (!result) return response.status(404).json({ error: 'Blueprint not found.' });
        return response.status(200).json(result);
      } catch (error) {
        if (error.message === 'DATABASE_UNAVAILABLE') return response.status(503).json({ error: 'Blueprint storage is temporarily unavailable.' });
        console.error('Blueprint retrieval failed.');
        return response.status(500).json({ error: 'We could not load this blueprint. Please try again.' });
      }
    },
  };
}
