
import React from 'react';
import { Box, Flex, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, IconButton, Button, useDisclosure } from '@chakra-ui/react';
import { Documents as DocumentsState } from '../state/Documents';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { CreateDocumentModal } from '../components/CreateDocumentModal';

export interface IProps {
}

export default function Documents({}: IProps) {

  const { documents } = DocumentsState.useContainer();
  const { isOpen: isCreateDocumentOpen, onOpen: onOpenCreateDocument, onClose: onCloseCreateDocument} = useDisclosure();

  return <>
    <CreateDocumentModal isOpen={isCreateDocumentOpen} onClose={onCloseCreateDocument} />
    <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
      <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
        <Box w={1200}>
          <Flex justify="space-between">
            <Heading>Documents</Heading>
            <Button
              fontSize="sm"
              fontWeight={600}
              color="white"
              bg="#4a9f66"
              _hover={{
                bg: '#56b877',
              }}
              onClick={onOpenCreateDocument}
            >
              Create document&nbsp;
              <FiPlus size={18} />
            </Button>
          </Flex>
          <Table mt={4}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th w={60}>Type</Th>
                <Th w={10} isNumeric>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {
                documents === undefined
                ? <Tr><Td><Spinner /></Td><Td /><Td /></Tr>
                : documents.map(
                  document => (
                    <Tr
                      key={document.id}
                      cursor="pointer"
                      onClick={() => window.open(`/documents/${document.id}`, '_blank')}
                      _hover={{ background: '#FCFCFC' }}
                    >
                      <Td>{document.name}</Td>
                      <Td>{document.mimeType}</Td>
                      <Td><IconButton
                        aria-label="delete"
                        icon={<FiTrash />}
                        // onClick={}
                      /></Td>
                    </Tr>
                  )
                )
              }
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Flex>
  </>;
}
