from __future__ import print_function
import time
import json
import urllib.parse
import boto3
import urllib.request

print('Loading function')

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        transcribe = boto3.client('transcribe')
        bucket = event['Records'][0]['s3']['bucket']['name']
        path = event['Records'][0]['s3']['object']['key']
        job_uri = 'https://' + bucket + '.s3.amazonaws.com/' + path
        print(job_uri)
        job_name = key.replace('public/', '').replace('.wav', '')
        transcribe.start_transcription_job(
            TranscriptionJobName = job_name,
            Media = {'MediaFileUri': job_uri},
            MediaFormat = 'wav',
            LanguageCode = 'en-US'
        )
        while True:
            status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
            if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
                break
            print("Not ready yet...")
            time.sleep(5)
            
        transcriptURI = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
        print('about to fetch transcript: ' + transcriptURI)
        transcript_contents = urllib.request.urlopen(transcriptURI).read()
        transcript = json.loads(transcript_contents)
        print(transcript['results']['transcripts'][0]['transcript'])
        s3.put_object(ACL='public-read', Body=bytes(transcript['results']['transcripts'][0]['transcript'], 'utf-8'), Bucket=bucket, Key='public/'+job_name+'.txt')
        print('uploaded transcript')
        
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
