
import { Flex, Box, Heading, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { KeyStore } from '../state/KeyStore';
import { readFile } from '../utils/files';
import { useToast } from '@chakra-ui/react';

export interface IProps {
}

export default function ResetPassword({}: IProps) {

  const [email, setEmail] = useState('');
  const [newPassword, setPassword] = useState('');
  const [failsafeSecretKey, setfailsafeSecretKey] = useState<string | undefined>(undefined);
  const { resetPassword, isLoggedIn } = KeyStore.useContainer();
  const history = useHistory();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !justLoggedIn) {
      history.replace('/documents');
    }
  }, [isLoggedIn]);

  const errorToast = useToast();

  return <Flex w="100vw" minH="100%" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mt={16} mb={16} flexDir="row" justifyContent="space-around">
      <Box borderWidth={1} rounded="3xl" p={4} w={460}>

        <Heading size="md" fontWeight={500} mb={4}>Reset password</Heading>

        <FormControl mb={3}>
          <FormLabel>Email</FormLabel>
          <Input
            type="text"
            placeholder="e.g. mail@example.com"
            size="sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl mb={2}>
          <FormLabel>Failsafe key</FormLabel>
          <input
            type="file"
            onChange={async e => {
              const file = e.target.files!.item(0) ?? undefined;
              if (file !== undefined) {
                setfailsafeSecretKey(await readFile(file!));
              } else {
                setfailsafeSecretKey(undefined);
              }
            }}
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>New password</FormLabel>
          <Input
            type="password"
            size="sm"
            value={newPassword}
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
              const result = await resetPassword(email, newPassword, failsafeSecretKey!);
              if (result) {
                setJustLoggedIn(true);
                history.push('/documents');
              } else {
                errorToast({
                  title: 'Failed to reset password. Please check your email and key.',
                  status: 'error',
                  isClosable: true,
                });
              }
            }}
            disabled={failsafeSecretKey === undefined || email === '' || newPassword === '' }
          >
            Submit
          </Button>
        </Flex>

      </Box>
    </Flex>
  </Flex>;
}
