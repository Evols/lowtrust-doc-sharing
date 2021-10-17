
import React from 'react';
import { Box, Text, Flex, Heading } from '@chakra-ui/react';

export interface IProps {
}

export default function SignUpCompleted({}: IProps) {

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
      <Box borderWidth={1} rounded="3xl" p={4} w={460}>

        <Heading size="md" fontWeight={500} mb={4}>You have successfully signed-up!</Heading>

        <Text mb={2}>Your fallback key was just downloaded. Please keep it somewhere safe, as it allows anyone having it to reset your password.</Text>
        <Text mb={2}>Also, keep it somewhere you can access it, because if you forget your password, this will be the only mean to access your account and your documents.</Text>

      </Box>
    </Flex>
  </Flex>;
}
