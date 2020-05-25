/**
 * Helper utils method - allows to make GIOS API requests in smaller
 * batches. When we attempt to fetch data for all sensors simultaneously
 * (nearly 200 requests for sensor data and nearly 700 for records) - the
 * server closes connections. This method allows to make requests in batches
 * of 70-100 units - to take leverage of synchronous requesting and speed
 * up fetching using Promise.all()
 *
 * @param {[String]} params     Array of API params for all requests
 * @param {Number}   portions   The number of batches to split request
 *                              pool into
 *
 * @param {Function} async_operation    the data fetching operation
 *                                      (call to particular GIOS API)
 */

const process_split_requests = async (params, portions, async_operation) => {
    // helper methods which returns 2D array of requests params to
    // be processed
    function split_requests_array(array, number_of_chunks) {
        if (number_of_chunks <= 0 || number_of_chunks >= array.length) {
            return array;
        }
        const chunk = array.length / number_of_chunks;
        let chunked = [];
        for (i = 0; i < array.length; i += chunk) {
            let temp_array = array.slice(i, i + chunk);
            chunked.push(temp_array);
        }

        return chunked;
    }

    // split request params pool to subarrays
    const split_requests = split_requests_array(params, portions);

    let results = [];

    // now process each subarray individually
    for (const portion of split_requests) {
        const promises = portion.map((param) => async_operation(param));

        // Promise.all() allows us not to wait while previous request resolves
        // The returned promise will be resolved when last single promise
        // in the batch resolves. So we process many requests in parallel,
        // which speeds up operations
        const portion_results = await Promise.all(
            promises.map((p) => p.catch((e) => e))
        );
        const valid_portion_results = portion_results.filter(
            (result) => !(result instanceof Error)
        );
        results = results.concat(valid_portion_results);
    }

    return results;
};

module.exports = process_split_requests;
