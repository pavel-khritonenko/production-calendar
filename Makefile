.PHONY: dist
dist:
	@rm -r $@
	@tsc

run: dist
	@node $<