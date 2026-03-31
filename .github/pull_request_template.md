## Pull Request Template

### Description

<!-- Brief description of what this PR changes -->

### Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Other (please describe)

### Related Issues

<!-- Closes #123, Fixes #456, etc. -->

### Changes Made

<!-- List the specific changes made in this PR -->

- 

### Testing

- [ ] Unit tests pass locally
- [ ] Integration tests pass locally  
- [ ] Manual testing completed
- [ ] Added new tests for new functionality
- [ ] All existing tests still pass

### Code Quality Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of the code completed
- [ ] Code is properly commented where needed
- [ ] No console.log statements left in production code
- [ ] No hardcoded values that should be configurable
- [ ] Error handling is implemented appropriately

### Documentation

- [ ] API documentation updated (if applicable)
- [ ] README.md updated (if applicable)
- [ ] Inline code comments added/updated
- [ ] CHANGELOG.md updated (if applicable)

### Environment Testing

- [ ] Tested on development environment
- [ ] Tested on testnet (if applicable)
- [ ] Browser compatibility checked (if frontend changes)

### Smart Contract Specific (if applicable)

- [ ] Contract builds without warnings
- [ ] `cargo clippy` passes without warnings
- [ ] `cargo fmt` check passes
- [ ] Gas consumption optimized
- [ ] Security considerations addressed
- [ ] Contract tests pass

### Performance Considerations

- [ ] No performance regressions introduced
- [ ] Database queries optimized (if applicable)
- [ ] Memory usage considered
- [ ] Network requests minimized

### Security Considerations

- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization considered
- [ ] Dependencies checked for vulnerabilities

### Deployment

- [ ] Migration scripts provided (if database changes)
- [ ] Environment variables documented
- [ ] Deployment steps tested

### Additional Notes

<!-- Any additional information reviewers should know -->

---

### Reviewer Guidelines

For reviewers:

1. **Focus on**: Logic, security, performance, and maintainability
2. **Check for**: Proper error handling, edge cases, and test coverage
3. **Verify**: Documentation is accurate and up-to-date
4. **Test**: The changes work as expected in your environment
5. **Suggest**: Improvements or alternative approaches when applicable

### Merge Requirements

- [ ] All automated checks pass
- [ ] At least one maintainer approval
- [ ] All reviewer feedback addressed
- [ ] No merge conflicts
- [ ] Ready for production deployment
