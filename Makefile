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

Deploy:
	git push
