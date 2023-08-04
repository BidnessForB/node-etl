function computeErrorThreshold(err1, err2, options) {
  var result;
  if (typeof err1 === 'undefined' || typeof err2 === 'undefined') {
    return options.missingDataToken;
  }
  if (err1 === null || err2 === null) {
    return options.missingDataToken;
  }
  if (err1 === '' || err2 === '') {
    return options.missingDataToken;
  }
  if (isNaN(err1) || isNaN(err2)) {
    return "err";
  }
  try {
    if (Math.abs(err1) === Math.abs(err2)) {
      result `±${Math.abs(err1)}`;
    }
    else {
      const max = Math.max(err1, err2);
      const min = Math.min(err1, err2);
      result = `+${max}/${min}`   
    }
  }
  catch(e)
  {
    return options.errorToken;
  }
  
  return result;
}

function getValue(source, options) {
  if(typeof source !== 'undefined') {
    return source;
  }
  else {
    return options.missingDataToken;
  }
};



exports.transformRow = function(row, options) {
  return {
    name: row.pl_name,
    discoveryMethod:getValue(row.discoverymethod),
    facility: getValue(row.disc_facility),
    neighbors: getValue(row.sy_pnum),
    orbitsInDays: getValue(row.pl_orbper),
    orbitsIndaysError: computeErrorThreshold(
      row.pl_orbpererr1,
      row.pl_orbpererr2,
      options
    ),
    lastUpdate: getValue(row.rowupdate),
    hostStar: getValue(row.hostname),
  };
};
