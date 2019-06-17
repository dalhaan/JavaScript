
# JavaScript

A collection of helpful JavaScript utility scripts.

* pathsToAbsolute

## pathsToAbsolute

Recursively converts relative path import statments to absolute paths for all descending files of a target directory (relative to the root directory).

**Syntax**

```javascript
usage:
  node pathsToAbsolute.js <root directory> <target directory>
parameters:
  root directory - The root directory that imports will be relative to.
  target directory - The target directory.
```

**Example**

File structure

```
/
└─ users
   └─ dalhaan
      └─ project
         └─ src
            └─ components
               ├─ MaskedInput
               │  └─ index.js
               └─ Flow
                  └─ SignUp
                     └─ index.js
```

```javascript
node pathsToAbsolute.js '/users/dalhaan/project/src' '/users/dalhaan/project/src/components'
```

**Flow/SignUp/index.js**

Before:

```javascript
import { MaskedInput } from '../../../MaskedInput';
...
```

After:

```javascript
import { MaskedInput } from 'components/MaskedInput';
...
```
