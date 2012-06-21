################################################
# !/bin/bash
# 
# Record the current build information.
#
# @author J.Frizelle
# @date 23-May-2008
#
################################################

SVNREV=`git log --pretty=format:'%h' --max-count=1`
echo $SVNREV
TODAY=`date +'%Y-%m-%d %H:%M'`

echo  $SVNREV > /tmp/gitrev.txt
echo  $SVNREV '    ' $TODAY > /tmp/today.txt

