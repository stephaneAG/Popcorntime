# the following is to be run in /tmp/Popcorn-Time, or whatever the configured cache dir is
# the pipe to the 'sort' call is done so that we have an ordered list of '<xxx>.S<digit(s)>E<digits>', like in 'Narcos.S01E01'

# when looking for some stuff WITHOUT popcorntime running, it's some time useful to do something else than 'ls -R | grep Narcos'

SEARCH="Narcos"
for dir in $(ls -1); do
  if [[ "$dir" != "TorrentCache" ]] && [[ "$dir" != "torrent-stream" ]]; then
    chunk=$(ls "$dir" | head -1 ); 
    if [[ "${chunk%%.*}" == "${SEARCH}"  ]]; then
      echo -en "$chunk \t -->  "; # echo the subdir name ( the one that starts with SEARCH )
      vid=$(ls "$dir/$chunk" | head -1 ); # is likely to print some video name
      echo "$vid"
    fi; 
  fi
done | sort
