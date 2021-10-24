
export function mimeTypeFromExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case 'md':
      return 'text/markdown';
  }
  return undefined;
}
