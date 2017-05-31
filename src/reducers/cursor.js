export function storeCursorInfo(state = [], action) {
  switch (action.type) {
    case 'SAVE_CURSOR_INFO':
      return action.cursorInfo;
      
    default:
      return state;
  }
}
