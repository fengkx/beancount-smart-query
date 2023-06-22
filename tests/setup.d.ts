declare namespace chai {
  interface Assertion {
    toMatchSnapshot(message?: string): Assertion
  }
}
