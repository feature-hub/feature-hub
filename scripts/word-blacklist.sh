#!/bin/sh

if [ -z "$BLACKLIST" ] ; then
  echo "Empty word blacklist; aborting"
  exit 0
fi

# replace every comma with a pipe
BLACKLIST_REGEXP=$(echo "$BLACKLIST" |tr "," "|")
# read .gitignore, replace newlines with pipes and remove the last pipe
IGNORE=$(tr "\n" "|" < .gitignore |sed -e 's/|$//')

MATCHES=$(grep --extended-regexp --word-regexp --recursive --regexp="$BLACKLIST_REGEXP" . |grep --extended-regexp --invert-match --regexp="$IGNORE" |grep --extended-regexp --invert-match --regexp=".git")
RESULT=$?

if [ "$CI" != "true" ] ; then
  echo "$MATCHES"
fi

if [ $RESULT -eq 0 ] ; then
  echo "Found blacklisted word in sources. Failing..."
  exit 1
else
  exit 0
fi
