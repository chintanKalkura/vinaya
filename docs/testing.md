# Testing

**Libraries**: Jest + React Native Testing Library

**Coverage**: All new components and utility functions must have tests. Minimum 80% coverage on business logic (habit state, streak calculation, data serialization).

**Naming conventions**:
Test files should be named as<ComponentName>.test.tsx or <utilName>.test.ts, colocated with the source file.
Test blocks should follow describe('<ComponentName>') wrapping it('should <behaviour>')

**Standards**:
Test behaviour, not implementation
One assertion per test where possible
Mock AsyncStorage in all tests — never hit real storage in tests
