
echo -n | openssl s_client -connect gitlab.kkcorp:443 | sudo sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ca.crt

sudo docker stop multi-runner && sudo docker rm multi-runner
sudo docker run -d --name multi-runner --restart always \
  -v /var/data:/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ayufan/gitlab-ci-multi-runner:latest
sudo docker exec -it multi-runner gitlab-ci-multi-runner register

cd /usr/local/share/ca-certificates/
sudo cp ~/ca.crt .
sudo update-ca-certificates

sudo gitlab-ci-multi-runner register \
-n \
-u "https://gitlab.kkcorp/ci" \
-r "0d92bfa3e5ee9b9344f07213e283d3" \
-d "web-ci-runner-01" \
-e "docker" \
--docker-image "php:5.6.14-apache"

ssh://git@gitlab.local:10022/root/test-project.git



https://hub.docker.com/_/php/



image: php:5.6.14-apache

stages:
  - build
  - test

job1:
  stage: build
  script:
    - composer install
  only:
    - master
  tags:
    - docker