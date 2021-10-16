
import { Flex, Box, Heading, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import { KeyStore } from '../state/KeyStore';

export interface IProps {
}

export default function SignIn({}: IProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithPassword } = KeyStore.useContainer();

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
      <Box borderWidth={1} rounded="3xl" p={4} w={460}>

        <Heading size="md" fontWeight={500} mb={4}>Sign in</Heading>

        <FormControl mb={2}>
          <FormLabel>Email</FormLabel>
          <Input
            type="text"
            placeholder="e.g. mail@example.com"
            size="sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            size="sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </FormControl>

        <Flex w="100%" flexDir="row-reverse">
          <Button
            fontSize="sm"
            fontWeight={600}
            color="white"
            bg="#4a9f66"
            _hover={{
              bg: '#56b877',
            }}
            onClick={async () => {
              await loginWithPassword(email, password);
            }}
          >
            Submit
          </Button>
        </Flex>

      </Box>
    </Flex>
  </Flex>;
}
