Contributing to Brisket
=======================

If you'd like to help us improve and extend Brisket and become a part of the Brisket community, then we welcome your contributions! Below you will find some simple steps required to be able to contribute to Brisket. If you have any questions about this process or any other aspect of contributing to a Bloomberg open source project, feel free to send an email to open-tech@bloomberg.net and we'll get your questions answered as quickly as we can.

### Contribution Licensing

Since Brisket is distributed under the terms of the Apache License, Version 2.0, contributions that you make to Brisket are licensed under the same terms. In order for us to be able to accept your contributions, we will need explicit confirmation from you that you are able and willing to provide them under these terms, and the mechanism we use to do this is called a Developer's Certificate of Origin DCO. This is very similar to the process used by the Linux(R) kernel, Samba, and many other major open source projects.

To participate under these terms, all that you must do is include a line like the following as the last line of the commit message for each commit in your contribution:

```bash
Signed-Off-By: Random J. Developer <random@developer.example.org>
```

You must use your real name (sorry, no pseudonyms, and no anonymous contributions).

## Pull Requests

1. Fork the repo and create a feature branch from master.
2. Make sure to add tests for you changes unless you've only modified documentation.
3. Please update the documentation if your changes modify the API.
4. Ensure that the test suite passes.
5. Make sure that your commit messages comply with the [contribution licensing](#contribution-licensing) mentioned above.

### Running the tests
Run

```bash
$ npm install
$ npm test
```

### Code Style
Let the machines do the work! Our test suite includes jshint. It will ensure that your code conforms to Brisket's style.


## Found a bug?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our [issues](http://github.com/bloomberg/brisket/issues). Even better help us out by submitting the fix in a pull request./
