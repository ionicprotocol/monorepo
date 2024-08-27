# Adrastia Periphery

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![591 out of 591 tests passing](https://img.shields.io/badge/tests-591/591%20passing-brightgreen.svg?style=flat-square)
![test-coverage 100%](https://img.shields.io/badge/test%20coverage-100%25-brightgreen.svg?style=flat-square)

Adrastia Periphery is a set of Solidity smart contracts that complement the [Adrastia Core](https://github.com/adrastia-oracle/adrastia-core) smart contracts.

## Install

### Requirements

- node: v16 or later
- yarn
- git

### Recommendations

- Operating system: Linux (Fedora is used for development and testing)

### Procedure

1. Clone the repository

```console
git clone git@github.com:adrastia-oracle/adrastia-periphery.git
```

2. Enter the project folder

```console
cd adrastia-periphery
```

3. Install using yarn (npm should work too)

```console
yarn install --lock-file
```

## Usage

### Accessing the smart contracts

The Adrastia Periphery smart contracts are available via the npm artifact `@adrastia-oracle/adrastia-periphery`.

#### Install

```console
yarn add @adrastia-oracle/adrastia-periphery
```
or
```console
npm install @adrastia-oracle/adrastia-periphery
```

## Security

If any security vulnerabilities are found, please contact us via Discord (TylerEther#8944) or email (tyler@trilez.com).

## Contributing

Please refer to the [contributing guide](CONTRIBUTING.md).

## License

Adrastia Periphery is licensed under the [MIT License](LICENSE).

### Exceptions

- The files located at [contracts/vendor/chainlink](contracts/vendor/chainlink/) is licensed under a different [MIT License](contracts/vendor/chainlink/LICENSE_MIT).