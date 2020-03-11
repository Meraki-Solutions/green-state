## [Unreleased]

# 2.0.0 (2019-03-11)

* `container.get` no longer creates instance in parent containers. It will use dependencies that already exist in parent containers, but it will only register unresolved dependencies in the container in which the original request was made.

# 1.1.0 (2019-09-18)

# 1.0.1 (2019-08-30)

# 1.0.0 (2019-08-08)

## 0.3.0 (May 22, 2019)

Changes that have landed in master but are not yet released.

## 0.3.0 (May 22, 2019)

* Require at least React 16.6 since that is when static contextType was introduced

## 0.2.0 (May 22, 2019)

* Fix bug where inheriting services from parent containers was not working

## 0.1.1 (May 21, 2019)

* README code example fixes, typos

## 0.1.0 (May 21, 2019)

* Initial release
