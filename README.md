# Git Flow Tools
1. provide gitflow cli
2. auto write git hooks



## Usage

```
npm install git-flow-cli --save-dev
```



## Default Hooks

### pre-commit

- branchs which are not allowed to commit (master|staging|qa|release|develop)
- find your scripts which contains eslint/tslint and run



### commit-msg

- check your commit message over [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)


### pre-push

- branchs which are not allowed to push (master|staging|qa|release|develop)




## Custom Config

put config in {your_project}/gitflow.js(on) like

```json
{
	"${hook_name}": [ "${command}" ] 
}
```

eg:

```json
{
	"pre-commit": [ "npm run lint" ]
}
```

