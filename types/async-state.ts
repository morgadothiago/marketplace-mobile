/**
 * Estado padrão para qualquer operação assíncrona da UI (loading/error/success).
 * Usado por contexts/hooks para evitar reinventar o mesmo formato em cada tela.
 */
export type AsyncState<TData> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: TData | null; error: null }
  | { status: 'success'; data: TData; error: null }
  | { status: 'error'; data: TData | null; error: string };
