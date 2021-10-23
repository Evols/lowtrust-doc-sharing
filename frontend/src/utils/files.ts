
export const readFile = (file: File): Promise<string> => new Promise(
  (resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(file as any);
  }
);
