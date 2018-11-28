#!/bin/sh
#set -x

if [ "x$BLACKLIST" = "x" ] ; then
  echo "Empty word blacklist; aborting"
  exit 0
fi

BLACKLIST_REGEXP=$(echo $BLACKLIST |tr "," "|")
IGNORE=$(cat .gitignore |tr "\n" "|" |sed -e 's/|$//')

MATCHES=$(grep --extended-regexp --word-regexp --recursive --regexp="$BLACKLIST_REGEXP" . |grep --extended-regexp --invert-match --regexp="$IGNORE" |grep --extended-regexp --invert-match --regexp=".git|docs/api")
RESULT=$?

if [ "$CI" != "true" ] ; then
  echo $MATCHES
fi

if [ $RESULT -eq 0 ] ; then
  echo "Found blacklisted word in sources. Failing..."
  exit 1
else
  exit 0
fi

