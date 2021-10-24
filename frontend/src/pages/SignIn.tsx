
import { Flex, Box, Heading, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { KeyStore } from '../state/KeyStore';
import { useToast } from '@chakra-ui/react';

export interface IProps {
}

export default function SignIn({}: IProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithPassword, isLoggedIn } = KeyStore.useContainer();
  const history = useHistory();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !justLoggedIn) {
      history.replace('/documents');
    }
  }, [isLoggedIn]);

  const errorToast = useToast();

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt="calc(32vh - 200px)" flexDir="row" justifyContent="space-around">
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
              const result = await loginWithPassword(email, password);
              if (result) {
                setJustLoggedIn(true);
                history.push('/documents');
              } else {
                errorToast({
                  title: 'Failed to sign-in. Please check your email and password.',
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
    
    <Flex w="100vw" mt={2} mb={16} flexDir="row" justifyContent="space-around">

      <Flex flexDir="row" justifyContent="space-around" w="100%" mt={2}>
        <Link style={{ color: 'gray' }} to="/resetpassword">I forgot my password</Link>
      </Flex>

    </Flex>

  </Flex>;
}
