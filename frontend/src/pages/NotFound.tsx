
import { Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

export interface IProps {
}

export default function NotFound({}: IProps) {

  const [remainingSeconds, setRemainingSeconds] = useState(5);
  const history = useHistory();
  useEffect(() => {
    if (remainingSeconds > 0) {
      setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);
    } else {
      history.push('/signin');
    }
  }, [remainingSeconds]);

  return <Flex w="100vw" mt="calc(48vh - 158px)" flexDir="column" justifyContent="space-around">
    <Flex w="100vw" mb={4} flexDir="row" justifyContent="space-around">
      <Text fontSize="5xl" color="grey">Page not found</Text>
    </Flex>
    <Flex w="100vw" mb={16} flexDir="row" justifyContent="space-around">
      <Text fontSize="3xl" color="grey">Redirecting{remainingSeconds > 0 ? ` in ${remainingSeconds}s` : ''}...</Text>
    </Flex>
  </Flex>;
}
