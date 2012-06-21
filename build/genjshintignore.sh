#!/bin/bash

for i in `cat .jshintignore-src`;do find . | grep $i;done