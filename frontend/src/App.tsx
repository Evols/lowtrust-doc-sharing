
import React from 'react';
import { Box } from '@chakra-ui/layout';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import SignUp from './pages/SignUp';
import { Text, ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { KeyStore } from './state/KeyStore';
import SignIn from './pages/Signin';

export function App() {
  return (
    <ChakraProvider>
      <KeyStore.Provider>
        <Router>
          <Box>

            <Navbar />

            <Switch>

              <Route path="/signup">
                <SignUp />
              </Route>

              <Route path="/signin">
                <SignIn />
              </Route>

              <Route path="/" exact>
                <Redirect to="/signin" />
              </Route>

            </Switch>

          </Box>
        </Router>
      </KeyStore.Provider>
    </ChakraProvider>
  );
}
