SOURCES:=$(shell find . -type d -a \( -name test -o -name node_modules -o -name .git -o -name .nuxt \) -prune -o -print)
DIST:=dist
PWD:=$(shell pwd)

$PHONY: \
	Serve_locally \
	Update_all_course_dependencies \
	Generate_static_site \
	Upload_as_development_site

Serve_locally:
	guake -e "cd ${PWD} && npm run dev"

Deploy_DEV:
	git checkout develop
	export REVISION=$$(( $$(cat package.json | grep -P '"version":\s*"[0-9]+\.[0-9]+\.[0-9]+"' | grep -oP '[0-9]+"' | grep -oP '[0-9]') + 1 ))
	sed -i package.json -E -e 's/^(\s*"version":\s*"[0-9]+\.[0-9]+\.)[0-9]+/\1'$${REVISION}/
	git add package.json
	git commit -m 'updated version number to '$$(cat package.json | grep -P '"version":\s*"[0-9]+\.[0-9]+\.[0-9]+"' | grep -oP '[0-9]+\.[0-9]+\.[0-9]+')
	git push

Deploy_PROD:
	git checkout master
	git merge develop
	git push
	git checkout develop
