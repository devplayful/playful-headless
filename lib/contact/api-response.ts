export function pendingConfirmationResponse(replayed: boolean, dryRun: boolean) {
  return {
    status: 202 as const,
    body: {
      success: false,
      pendingConfirmation: true,
      message: 'La entrega de tu solicitud aún no está confirmada. Para evitar duplicados, no la envíes de nuevo. Si no recibes respuesta en un día laborable, escríbenos a hello@playfulagency.com.',
      crm: { synced: false, dryRun },
      analytics: { generateLead: false },
      replayed,
    },
  };
}
