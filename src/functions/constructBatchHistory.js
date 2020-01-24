const constructBatchHistory = async batch => {
  const batches = new Array();
  batch.forEach(async curBatch => {
    batchObj = {
      batch: curBatch._id
    };
    const subjects = new Array();
    curBatch.subjects.forEach(async curSubject => {
      subjects.push(curSubject._id);
    });
    batchObj.subjects = subjects;
    batches.push(batchObj);
  });
  return batches;
};

module.exports = constructBatchHistory;
