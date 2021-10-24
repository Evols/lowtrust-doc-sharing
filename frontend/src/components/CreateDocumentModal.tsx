
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalOverlay, ModalBody } from '@chakra-ui/modal';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { readFile } from '../utils/files';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import { Flex } from '@chakra-ui/layout';
import { Documents } from '../state/Documents';
import { encodeBase64 } from 'tweetnacl-util';
import { mimeTypeFromExtension } from '../utils/mimeTypes';

export interface IProps {
  isOpen: boolean,
  onClose: () => void,
}

export function CreateDocumentModal({ isOpen, onClose }: IProps) {

  const { createDocument } = Documents.useContainer();

  const [content, setDocContent] = useState<Uint8Array | undefined>(undefined);
  const [name, setName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');

  return <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Create document</ModalHeader>
      <ModalBody>

      <FormControl mb={2}>
          <FormLabel>File</FormLabel>
          <input
            type="file"
            onChange={async e => {
              const file = e.target.files!.item(0) ?? undefined;
              if (file !== undefined) {
                const newContent = await readFile(file);
                const extension = file.name.match(/\.[^\.]*$/)?.[0];
                const extensionMimeType = extension !== undefined ? mimeTypeFromExtension(extension.substr(1, extension.length)) : undefined;
                setDocContent(newContent);
                setName(file.name.replace(/\.[^\.]*$/, ''));
                setMimeType(extensionMimeType !== undefined ? extensionMimeType : file.type);
              } else {
                setDocContent(undefined);
                setName('');
                setMimeType('');
              }
            }}
          />
        </FormControl>

        <FormControl mb={2}>
          <FormLabel>Document name</FormLabel>
          <Input size="sm" value={name} onChange={e => setName(e.target.value)} />
        </FormControl>

        <FormControl mb={2}>
          <FormLabel>Document MIME type</FormLabel>
          <Input size="sm" value={mimeType} onChange={e => setMimeType(e.target.value)} />
        </FormControl>

        <Flex flexDir="row-reverse" mt={4} mb={2}>

          <Button
            display={{
              base: 'none',
              md: 'inline-flex',
            }}
            fontSize="sm"
            fontWeight={600}
            color="white"
            bg="#4a9f66"
            _hover={{
              bg: '#56b877',
            }}
            onClick={() => {
              createDocument({
                name,
                mimeType,
                content: encodeBase64(content!),
              });
              onClose();
            }}
            disabled={name.length === 0 || mimeType.length === 0 || content === undefined}
          >
            Create document
          </Button>

        </Flex>

      </ModalBody>

    </ModalContent>
  </Modal>;
}
