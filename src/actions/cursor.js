export function cursorAction(cursorInfo) {
  return {
    type: 'SAVE_CURSOR_INFO',
    cursorInfo
  };
}
