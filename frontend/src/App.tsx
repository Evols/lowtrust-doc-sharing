
import React from 'react';
import { Box } from '@chakra-ui/layout';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import SignUp from './pages/SignUp';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { KeyStore } from './state/KeyStore';
import SignIn from './pages/Signin';
import SignUpCompleted from './pages/SignUpCompleted';
import NotFound from './pages/NotFound';
import Documents from './pages/Documents';
import ResetPassword from './pages/ResetPassword';
import { Documents as DocumentsState } from './state/Documents';
import DocumentDetails from './pages/DocumentDetails';

export function App() {
  return (
    <ChakraProvider>
      <KeyStore.Provider>
        <DocumentsState.Provider>
          <Router>
            <Box>

              <Navbar />

              <Switch>

                <Route path="/documents" exact>
                  <Documents />
                </Route>

                <Route path="/documents/:id" exact>
                  <DocumentDetails />
                </Route>

                <Route path="/signup/completed" exact>
                  <SignUpCompleted />
                </Route>

                <Route path="/signup" exact>
                  <SignUp />
                </Route>

                <Route path="/signin" exact>
                  <SignIn />
                </Route>

                <Route path="/resetpassword" exact>
                  <ResetPassword />
                </Route>

                <Route path="/" exact>
                  <Redirect to="/signin" />
                </Route>

                <Route path="/">
                  <NotFound />
                </Route>

              </Switch>

            </Box>
          </Router>
        </DocumentsState.Provider>
      </KeyStore.Provider>
    </ChakraProvider>
  );
}
