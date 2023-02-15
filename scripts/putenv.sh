# aws cli 설치 필요
# aws login 필요

echo "root path의 stories-backend.env파일에 production 환경변수를 전부 작성해 주세요."

aws s3 cp stories-backend.env s3://files.stories/stories-backend.env

echo "Success uploaded."
