
import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input } from '@chakra-ui/react';
import { KeyStore } from '../state/KeyStore';
import { useHistory } from 'react-router';
import { useToast } from '@chakra-ui/react';

export interface IProps {
}

export default function SignUp({}: IProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerWithPassword, isLoggedIn } = KeyStore.useContainer();
  const history = useHistory();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !justLoggedIn) {
      history.replace('/documents');
    }
  }, [isLoggedIn]);

  const errorToast = useToast();

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt="calc(32vh - 200px)" mb={16} flexDir="row" justifyContent="space-around">
      <Box borderWidth={1} rounded="3xl" p={4} w={460}>

        <Heading size="md" fontWeight={500} mb={4}>Sign up</Heading>

        <FormControl mb={2}>
          <FormLabel>Email</FormLabel>
          <Input
            type="text"
            placeholder="e.g. mail@example.com"
            size="sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <FormHelperText>This is used to identify you.</FormHelperText>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            size="sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <FormHelperText>Keep it very strong (at least 12 characters, not in the dictionary). Your encryption key will be generated based on this password.</FormHelperText>
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
              const result = await registerWithPassword(email, password);
              if (result) {
                setJustLoggedIn(true);
                history.push('/signup/completed');
              } else {
                errorToast({
                  title: 'Failed to sign-up. Maybe this email already has an account.',
                  status: 'error',
                  isClosable: true,
                });
              }
            }}
          >
            Submit
          </Button>
        </Flex>

      </Box>
    </Flex>
  </Flex>;
}
