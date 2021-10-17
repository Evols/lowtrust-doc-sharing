
import React from 'react';
import { Box, Text, Flex, Heading } from '@chakra-ui/react';
import { KeyStore } from '../state/KeyStore';

export interface IProps {
}

export default function Documents({}: IProps) {

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
      <Box borderWidth={1} rounded="3xl" p={4} w={460}>

      </Box>
    </Flex>
  </Flex>;
}
