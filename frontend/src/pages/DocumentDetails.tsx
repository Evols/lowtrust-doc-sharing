
import React from 'react';
import { Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import { Documents as DocumentsState } from '../state/Documents';
import { useParams } from 'react-router';
import { DocumentViewer } from '../components/DocumentViewer';

export interface IProps {
}

export default function DocumentDetails({}: IProps) {

  const { id: docId } = useParams<{ id: string }>();
  const { documents } = DocumentsState.useContainer();
  const doc = documents?.find(doc => doc.id === docId);

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
      <Box w={1200} maxW={1200}>
        <Heading mb={4}>
          Viewing {
            doc === undefined
            ? <Spinner />
            : <>{doc?.name} <span style={{ fontSize: 16, color: '#808080', fontWeight: 300 }}>{doc?.mimeType}</span></>
          }
        </Heading>
        {
          doc && <>
            <DocumentViewer document={doc} />
          </>
        }
      </Box>
    </Flex>
  </Flex>;
}
