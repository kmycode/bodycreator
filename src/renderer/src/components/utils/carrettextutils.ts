export const getCarretLineData = (
  text: string,
  selectionStart: number | null,
): Partial<{ editingLine: string; editingLinePosition: number; editingLineNumber: number }> => {
  if (typeof selectionStart !== 'number') {
    return {};
  }

  let editingLine;
  let editingLineNumber = 0;
  let editingLinePosition = 0;
  if (selectionStart) {
    let cursorPosition = 0;
    for (const line of text.split('\n')) {
      if (cursorPosition + line.length >= selectionStart) {
        editingLine = line;
        editingLinePosition = selectionStart - cursorPosition;
        break;
      }
      cursorPosition += line.length + 1;
      editingLineNumber++;
    }
  }

  return { editingLine, editingLineNumber, editingLinePosition };
};

export const replaceCarretLine = (text: string, selectionStart: number | null, replace: string): string => {
  const editingLine = getCarretLineData(text, selectionStart);

  if (typeof editingLine.editingLine === 'string' && typeof editingLine.editingLineNumber === 'number') {
    const lines = text.split('\n') as string[];
    lines[editingLine.editingLineNumber] = replace;
    const newValue = lines.join('\n');

    return newValue;
  } else {
    return replace;
  }
};
