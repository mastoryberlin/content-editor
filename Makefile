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

Update_all_course_dependencies:
	cd content/courses && shards update

Deploy_as_development_site:
	make Generate_static_site
	make Upload_as_development_site

Deploy:
	make Generate_static_site
	make Upload

Generate_static_site: # $(SOURCES)
	npm run generate --fail-on-error

Upload_as_development_site: dist
	echo "\
		cd /home/felix/static-server/dev \n\
		lcd ${PWD}/${DIST} \n\
		put -r *" \
	| sftp -b - root@mastory.io

Upload: dist
	echo "\
		cd /home/felix/static-server/public \n\
		lcd ${PWD}/${DIST} \n\
		put -r *" \
	| sftp -b - root@mastory.io


dist:
	mkdir $@
