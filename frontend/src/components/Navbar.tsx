
import React from 'react';

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Link,
  Popover,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';

import {
  HamburgerIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { KeyStore } from '../state/KeyStore';
import { useHistory } from 'react-router';

export default function Navbar() {

  const { isOpen, onToggle } = useDisclosure();
  const { isLoggedIn } = KeyStore.useContainer();
  const history = useHistory();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color="#4a9f66"
            fontWeight={500}
            fontSize={'md'}
          >
            Low-trust doc sharing
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >

          {
            isLoggedIn
            ? (
              <Button
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
              >
                Log out
              </Button>  
            )
            : <>
              <Button
                fontSize="sm"
                fontWeight={400}
                variant="link"
                onClick={() => history.push('/signin')}
              >
                Sign In
              </Button>
    
              <Link
                to="/signup"
              >
                <Button
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize="sm"
                  fontWeight={600}
                  color="white"
                  bg="#4a9f66"
                  _hover={{
                    bg: '#56b877',
                  }}
                  onClick={() => history.push('/signup')}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          }
        </Stack>
      </Flex>

    </Box>
  );
}

interface INavItemProps {
  label: string,
  to: string,
}

function NavItem({ label, to }: INavItemProps) {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  return (
    <Box>
      <Popover trigger={'hover'} placement={'bottom-start'}>
        <Link
          p={2}
          href={to}
          fontSize={'sm'}
          fontWeight={500}
          color={linkColor}
          _hover={{
            textDecoration: 'none',
            color: linkHoverColor,
          }}
        >
          {label}
        </Link>
      </Popover>
    </Box>
  );
}

const DesktopNav = () => {
  return (
    <Stack direction={'row'} spacing={4}>
      <NavItem label="Vault" to="/vaults" />
      <NavItem label="Documents" to="/documents" />
    </Stack>
  );
};
