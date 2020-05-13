import React, { useState, useEffect, useContext } from "react";

import { signInContext } from "./SignInContext";

import styled from "styled-components";

const SignIn = () => {
  const {
    signInWithGoogle,
    signInWithEmailAndPassword,
    handleSignOut,
  } = useContext(signInContext);

  return (
    <Wrapper>
      <UnstyledButton onClick={signInWithGoogle}>SignIn</UnstyledButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;
const UnstyledButton = styled.button`
  font-size: 100%;
  font-family: inherit;
  border: 0;
  padding: 0;
`;
export default SignIn;
