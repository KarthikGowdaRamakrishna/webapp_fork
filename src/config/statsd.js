import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import StatsD from "node-statsd";
   
  // Initialize StatsD client with a namespace
  const statsdClient = new StatsD({ prefix: "aws.s3." });
   
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
  });
   
  // Helper function to measure operation duration with StatsD
  async function withStatsD(operation, label, command) {
    const start = process.hrtime();
    try {
      const response = await s3Client.send(command);
      const diff = process.hrtime(start);
      const durationMs = diff[0] * 1000 + diff[1] / 1e6;
      statsdClient.timing(`${label}.duration`, durationMs);
      statsdClient.increment(`${label}.success`);
      return response;
    } catch (error) {
      statsdClient.increment(`${label}.error`);
      throw error;
    }
  }
   
  // Wrapped S3 operations with StatsD metrics
  export const uploadToS3 = (params) =>
    withStatsD("s3.upload", "upload", new PutObjectCommand(params));
   
  export const deleteFromS3 = async (params) => {
    try {
      const result = await s3Client.send(new DeleteObjectCommand(params));
      statsdClient.increment("s3.delete.success");
      return result;
    } catch (error) {
      statsdClient.increment("s3.delete.error");
      throw error;
    }
  };


  function sendMetricToCloudWatch(metricName, value, unit = "Count") {
    const params = {
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
        },
      ],
      Namespace: "csye6225_v3",
    };
   
    // No need to push data on local env
    if (process.env.NODE_ENV !== "test") {
      cloudwatch.putMetricData(params, (err) => {
        if (err) {
          console.error("Error sending metric to CloudWatch:", err);
        } else {
          console.log(
            `Metric sent to CloudWatch: ${metricName} with value ${value}`
          );
        }
      });
    }
  }

  const originalIncrement = statsdClient.increment;
  statsdClient.increment = function (stat, value = 1, sampleRate, tags, callback) {
    originalIncrement.call(this, stat, value, sampleRate, tags, callback);
    sendMetricToCloudWatch(stat, value, "Count");
  };
   
  const originalTiming = statsdClient.timing;
  statsdClient.timing = function (stat, time, sampleRate, tags, callback) {
    originalTiming.call(this, stat, time, sampleRate, tags, callback);
    sendMetricToCloudWatch(stat, time, "Milliseconds");
  };



  export { statsdClient };
   